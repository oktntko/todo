import { Link } from '~/router';

export default function Page() {
  return (
    <div>
      login
      <Link to="/" className="block">
        to top
      </Link>
      <Link to="/logout" className="block">
        to logout
      </Link>
    </div>
  );
}
