import Link from 'next/link';

export default function AboutPage() {
  return (
    <main>
      <h1>About This App</h1>
      <p>
        This is a peer-to-peer university tutoring app built with Next.js!
      </p>
      <nav>
        <Link href="/">Home</Link>
      </nav>
    </main>
  );
}