import Link from 'next/link';
import './globals.css';
import type { Metadata } from 'next';
export const metadata:Metadata={
  title:'Physical AI Mission Control | SO-101 × TurtleBot3',
  description:'Next.js + React + Three.js demo covering SSR, SSG, ISR, RSC, Server Actions, Streaming, SSE and WebSocket',
};
const routes=[['/','Mission'],['/technology','技術マップ'],['/ssg','SSG'],['/isr','ISR'],['/ssr','SSR'],['/streaming','Streaming']];
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ja"><body><div className="siteShell">
    <header className="siteHeader"><Link href="/" className="brand"><span className="brandMark">◈</span><span>PHYSICAL <strong>AI</strong><small> MISSION CONTROL</small></span></Link><nav aria-label="メインナビゲーション">{routes.map(([href,title])=><Link key={href} href={href}>{title}</Link>)}</nav></header>
    <main>{children}</main>
    <footer>SO-101 × TurtleBot3 Burger · Architecture testbed · Simulation & read-only telemetry only · Local development</footer>
  </div></body></html>;
}
