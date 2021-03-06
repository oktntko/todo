import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AiFillFileImage, AiFillTag } from "react-icons/ai";
import { FcSettings, FcTodoList } from "react-icons/fc";
import { MdAccessTimeFilled, MdCategory } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { Button } from "~/components/Button";
import { url } from "~/routers";

export const iconOptions = { size: "2rem", color: "#414855" };

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  return (
    <nav className="border-b border-gray-200 px-2 py-2.5 dark:bg-gray-800 sm:px-4">
      <div className="mx-auto flex flex-wrap items-center justify-between">
        <a href="/" className="flex items-center">
          <FcTodoList {...iconOptions} />
          <span className="ml-1 text-2xl font-bold text-gray-700">ToDo</span>
        </a>
        <button
          data-collapse-toggle="mobile-menu"
          type="button"
          className="ml-3 inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded="false"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <MenuIcon isMobileMenuOpen={isMobileMenuOpen} />
        </button>
        <div
          className={`${!isMobileMenuOpen ? "hidden" : ""} w-full md:block md:w-auto`}
          id="mobile-menu"
        >
          <ul className="mt-4 flex flex-col md:mt-0 md:flex-row md:gap-8 ">
            <li className="flex items-center justify-end">
              <NavLink
                to="/todos/list"
                className={({ isActive }) =>
                  `${
                    isActive ? "text-blue-600 underline" : "text-gray-700"
                  } block border-gray-100 bg-neutral-50 py-2 pr-4 pl-3 uppercase hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-white`
                }
              >
                ToDo List
              </NavLink>
            </li>
            <li className="flex items-center justify-end">
              <NavLink
                to="/todos/board"
                className={({ isActive }) =>
                  `${
                    isActive ? "text-blue-600 underline" : "text-gray-700"
                  } block border-gray-100 bg-neutral-50 py-2 pr-4 pl-3 uppercase hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-white`
                }
              >
                Board
              </NavLink>
            </li>
            <li className="flex items-center justify-end">
              <NavLink
                to="/todos/gantt"
                className={({ isActive }) =>
                  `${
                    isActive ? "text-blue-600 underline" : "text-gray-700"
                  } block border-gray-100 bg-neutral-50 py-2 pr-4 pl-3 uppercase hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-white`
                }
              >
                Gantt
              </NavLink>
            </li>
            <li className="flex items-center justify-end">
              <NavLink
                to="/todos/table"
                className={({ isActive }) =>
                  `${
                    isActive ? "text-blue-600 underline" : "text-gray-700"
                  } block border-gray-100 bg-neutral-50 py-2 pr-4 pl-3 uppercase hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-white`
                }
              >
                Table
              </NavLink>
            </li>
            <li className="flex items-end justify-end md:justify-end">
              <Button
                className="flex items-center border-none"
                onClick={() => setIsVisible(!isVisible)}
              >
                <FcSettings></FcSettings>
              </Button>
              <AnimatePresence>
                {isVisible && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ opacity: { ease: "easeInOut", duration: 0.2 } }}
                      className="absolute inset-0 z-10"
                      onClick={() => setIsVisible(false)}
                    ></motion.div>
                    <div className="relative">
                      <motion.div
                        className={`absolute right-0 z-10 w-32 divide-y divide-gray-100 rounded bg-white shadow dark:bg-gray-700 `}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ opacity: { ease: "easeInOut", duration: 0.2 } }}
                      >
                        <ul
                          className="py-1 text-sm text-gray-700 dark:text-gray-200"
                          aria-labelledby="dropdownDefault"
                        >
                          <li>
                            <NavLink
                              to={url.settings.statuses}
                              className={({ isActive }) =>
                                `${
                                  isActive ? "text-blue-600 underline" : "text-gray-700"
                                } flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`
                              }
                            >
                              <MdAccessTimeFilled />
                              <span className="uppercase">status</span>
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to={url.settings.categories}
                              className={({ isActive }) =>
                                `${
                                  isActive ? "text-blue-600 underline" : "text-gray-700"
                                } flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`
                              }
                            >
                              <MdCategory />
                              <span className="uppercase">category</span>
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to={url.settings.projects}
                              className={({ isActive }) =>
                                `${
                                  isActive ? "text-blue-600 underline" : "text-gray-700"
                                } flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`
                              }
                            >
                              <AiFillFileImage />
                              <span className="uppercase">project</span>
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to={url.settings.tags}
                              className={({ isActive }) =>
                                `${
                                  isActive ? "text-blue-600 underline" : "text-gray-700"
                                } flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`
                              }
                            >
                              <AiFillTag />
                              <span className="uppercase">tag</span>
                            </NavLink>
                          </li>
                        </ul>
                      </motion.div>
                    </div>
                  </>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function MenuIcon({ isMobileMenuOpen }: { isMobileMenuOpen: boolean }) {
  return (
    <>
      <svg
        className={`${isMobileMenuOpen ? "hidden" : ""} h-6 w-6`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        ></path>
      </svg>
      <svg
        className={`${!isMobileMenuOpen ? "hidden" : ""} h-6 w-6`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        ></path>
      </svg>
    </>
  );
}
