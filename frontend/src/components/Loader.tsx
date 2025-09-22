// Unopinionated page-level spinner.
// Kept small so it can be reused in routes and list placeholders.
const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-gray-400" />
    </div>
  );
};

export default Loader;
