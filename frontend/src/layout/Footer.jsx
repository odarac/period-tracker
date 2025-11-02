export default function Footer() {
  return (
    <footer className="custom-bg-color text-light py-4 mt-auto">
      <div className="container text-center">
        <p className="mb-1">© {new Date().getFullYear()} Period Tracker - v1.0</p>
      </div>
    </footer>
  );
}