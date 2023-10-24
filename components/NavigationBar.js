import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { useRouter } from 'next/router';


const MENU_LIST = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Audit", href: "/audit" },
  { title: "Users", href: "/users" },
];

export default function NavigationBar() {
  const { data: session } = useSession();
  const { asPath } = useRouter();


  return (
    <Navbar>
      <NavbarBrand>
        <p className="flex justify-start font-extrabold font-mono">United Way of Metro Atlanta: EFSP Dashboard</p>
      </NavbarBrand>
      <div></div><div></div>
      <div></div><div></div>
      <NavbarContent className="hidden sm:flex gap-5">

        {MENU_LIST.map((item, index) => (
          <NavbarItem key={index} isActive={asPath === item.href}>
            <Link
              isActive={asPath === item.href}
              key={index}
              href={item.href}
            >
              {item.title}
            </Link>
          </NavbarItem>)
        )}

      </NavbarContent>
      <div></div><div></div>
      <div></div><div></div>
      <NavbarContent justify="end">
        {session ? (
          <NavbarItem>
            <Button onClick={() => signOut()} color="primary" variant="flat">
              Sign Out
            </Button>
          </NavbarItem>
        ) : (

          <NavbarItem>
            <Button onClick={() => signIn()} color="primary" variant="flat">
              Sign In
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}
