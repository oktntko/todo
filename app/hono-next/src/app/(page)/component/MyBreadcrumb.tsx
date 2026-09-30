import { Children, Fragment } from 'react';

type MyBreadcrumbProps = React.HTMLAttributes<HTMLUListElement> & {
  children?: React.ReactNode;
  separator?: React.ReactNode;
};

export function MyBreadcrumb({ children, separator, ...props }: MyBreadcrumbProps) {
  const items = Children.toArray(children);

  return (
    <ul {...props}>
      {items.map((child, index) => (
        <Fragment key={index}>
          <li className="inline-flex items-center">{child}</li>
          {index !== items.length - 1 && (
            <li className="inline-flex items-center">
              {separator ?? <span className="icon-[weui--arrow-filled]" />}
            </li>
          )}
        </Fragment>
      ))}
    </ul>
  );
}
