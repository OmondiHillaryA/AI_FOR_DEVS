'''import { Poll } from '@/components/Poll';

export default function PollPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex justify-center items-center h-screen">
      <Poll pollId={params.id} />
    </div>
  );
}
'''