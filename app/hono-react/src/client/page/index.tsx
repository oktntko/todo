import { Link } from '~/router';

export default function Page() {
  return (
    <div>
      <div>index</div>
      <Link to="/login" className="block">
        to login
      </Link>
      <Link to="/logout" className="block">
        to logout
      </Link>
    </div>
  );
}
