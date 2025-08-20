import dynamic from 'next/dynamic'

const AppClient = dynamic(() => import('../App'), { ssr: false })

export default function Home() {
  return <AppClient />
}