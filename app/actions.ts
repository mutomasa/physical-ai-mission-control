'use server';
import { postMission } from '@/lib/simulator-api';
export async function startMission() { return postMission('start'); }
export async function stopMission() { return postMission('stop'); }
