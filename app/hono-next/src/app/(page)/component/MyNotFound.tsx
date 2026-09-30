import Link from 'next/link';

import { MyButton } from './button/MyButton';

export function MyNotFound() {
  return (
    <section className="bg-gray-50">
      <div className="container mx-auto flex min-h-screen items-center px-6 py-12">
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
          <p className="rounded-full bg-blue-50 p-3 text-sm font-medium text-blue-500">
            <span className="icon-[fa6-regular--face-dizzy] h-8 w-8" />
          </p>

          <h1 className="text-2xl font-semibold text-gray-800 md:text-9xl">404</h1>

          <p className="mt-4 text-gray-500">Not Found</p>

          <div className="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
            <MyButton tag={Link} href="/" color="blue">
              <span className="icon-[line-md--home-twotone] h-5 w-5 rtl:rotate-180" />
              <span>Back to Home</span>
            </MyButton>
          </div>
        </div>
      </div>
    </section>
  );
}
