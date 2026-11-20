#!/usr/bin/env python3
"""Read-only ROS 2 → local simulator overlay. Never publishes commands to a robot.

Requires ROS 2 rclpy, nav_msgs and sensor_msgs. Uses standard Python HTTP only.
Messages:
  /odom (nav_msgs/msg/Odometry),
  /joint_states (sensor_msgs/msg/JointState)
The SO-101 may use a different joint naming convention; update JOINT_ALIASES.
"""
import json
import math
import os
import urllib.error
import urllib.request
from typing import Optional

import rclpy
from rclpy.node import Node
from nav_msgs.msg import Odometry
from sensor_msgs.msg import JointState

URL = os.environ.get('SIM_HTTP_URL', 'http://127.0.0.1:8787')
TOKEN = os.environ.get('SIM_CONTROL_TOKEN', '')
JOINT_ALIASES = {
    'shoulder': ['shoulder_lift', 'shoulder', 'shoulder_pan'],
    'elbow': ['elbow_flex', 'elbow'],
    'wrist': ['wrist_flex', 'wrist'],
    'grip': ['gripper', 'grip'],
}


class ReadOnlyBridge(Node):
    def __init__(self):
        super().__init__('physical_ai_read_only_bridge')
        self.tb3: Optional[dict] = None
        self.arm: Optional[dict] = None
        self.create_subscription(Odometry, '/odom', self.on_odom, 10)
        self.create_subscription(JointState, '/joint_states', self.on_joints, 10)
        self.create_timer(0.25, self.send)
        self.get_logger().info('Read-only overlay active. No ROS publishing occurs.')

    def on_odom(self, msg):
        q = msg.pose.pose.orientation
        yaw = math.atan2(2 * (q.w * q.z + q.x * q.y),
                         1 - 2 * (q.y*q.y + q.z*q.z))
        self.tb3 = {'x': float(msg.pose.pose.position.x),
                    'z': float(msg.pose.pose.position.y), 'yaw': float(yaw)}

    def on_joints(self, msg):
        positions = dict(zip(msg.name, msg.position))
        mapped = {}
        for target, aliases in JOINT_ALIASES.items():
            for name in aliases:
                if name in positions and math.isfinite(positions[name]):
                    mapped[target] = float(positions[name])
                    break
        if mapped:
            self.arm = mapped

    def send(self):
        data = {}
        if self.tb3 is not None:
            data['tb3'] = self.tb3
        if self.arm is not None:
            data['arm'] = self.arm
        if not data:
            return
        req = urllib.request.Request(
            URL + '/ros/telemetry',
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'x-sim-token': TOKEN},
            method='POST',
        )
        try:
            with urllib.request.urlopen(req, timeout=0.25):
                pass
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            self.get_logger().warn(f'Simulator telemetry upload failed: {exc}', throttle_duration_sec=10)


def main():
    if len(TOKEN) < 32:
        raise SystemExit('Set SIM_CONTROL_TOKEN from .env.local in your ROS shell first.')
    rclpy.init()
    node = ReadOnlyBridge()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
