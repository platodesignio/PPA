interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ReportSection({ title, children }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </section>
  );
}
