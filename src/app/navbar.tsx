"use client";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  const menuLinks = [
    { href: "/#about-section", label: "אודות" },
    { href: "/#products-section", label: "מוצרים" },
    { href: "/#FAQ-section", label: "שאלות ותשובות" },
    { href: "/#contact-Us", label: "צרו קשר" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 200);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <header
      className={` fixed top-0 left-0 right-0 z-50 flex h-16 w-full shrink-0 items-center px-4 md:px-6 lg:justify-center lg:bg-white lg:bg-opacity-40 lg:backdrop-blur-md transition-transform duration-300 ${
        isVisible ? "transform-none" : "-translate-y-full"
      }`}
    >
      <h1 className="hidden text-3xl font-serif text-[#1A365D] font-bold lg:block">
        isKosher
      </h1>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 ml-3"
          >
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="">
          <div>
            <SheetTitle className="text-3xl font-serif text-[#1A365D] font-bold text-center">
              isKosher
            </SheetTitle>
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-pattern2 bg-cover bg-center custom-gradient"></div>

            <div className="grid gap-2 py-6 hebrew-side">
              {menuLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="flex w-full items-center py-2 text-lg lg:text-2xl font-semibold"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* <NavigationMenu className="hidden lg:flex max-w-full" dir="rtl">
        <div className="flex justify-between items-center w-full">
          {/* isKosher on the left */}

      {/* Navigation Links on the right */}
      {/* <NavigationMenuList className="flex space-x-0">
            {menuLinks.map((link) => (
              <NavigationMenuLink key={link.href} asChild>
                <Link
                  href={link.href}
                  className="text-stone-600 s-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                >
                  {link.label}
                </Link>
              </NavigationMenuLink>
            ))}
          </NavigationMenuList> */}
      {/* </div>
      </NavigationMenu> */}
      <h1 className="absolute right-2 top-2 text-[12px]">בס&rdquo;ד</h1>
    </header>
  );
}

interface MenuIconProps {
  [key: string]: any;
}

function MenuIcon(props: MenuIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function MountainIcon(props: MenuIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}