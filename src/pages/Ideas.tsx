import { IdeasTab } from '@/components/me/IdeasTab';

export default function Ideas() {
  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">My Ideas</h1>
        <p className="text-muted-foreground mt-2">
          Capture your next big thing. Scratchpad for your flashes of genius.
        </p>
      </div>
      <IdeasTab />
    </div>
  );
}
