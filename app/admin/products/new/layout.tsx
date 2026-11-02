export default function NewProductLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="flex justify-center px-4 py-8 md:px-20">
        <div className="w-full max-w-2xl [&>*]:mx-auto">{children}</div>
      </div>
    );
  }