import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { useRouter } from 'next/router';

// import UWALogo from ''



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
    <Navbar className="w-screen flex w-full flex-row place-content-between items-center border-b-2 border-zinc-500 border-opacity-75 p-5" isBordered >
      <NavbarBrand >
        {/* <img src="/UWALogo.png" width="30%" /> */}
        
        <p className="font-extrabold font-mono">United Way of Metro Atlanta: EFSP Dashboard</p>
      </NavbarBrand>
      <div className="mx-5"></div>
      <div className="mx-5"></div>
      <NavbarContent className="hidden sm:flex gap-4 inline-flex" justify="center">

        {MENU_LIST.map((item, index) => (
          <NavbarItem key={index} isActive={asPath === item.href} className="text-black">
            <Link
              isActive={asPath === item.href}
              key={index}
              href={item.href}
              className="text-black"
            >
              {item.title}
            </Link>
          </NavbarItem>)
        )}

      </NavbarContent>


      <div className="mx-5"></div>
      <div className="mx-5"></div>
      <NavbarContent className="inline-flex" justify="end">
        {session ? (
          <NavbarItem>
            <Button onClick={() => signOut()} color="danger" variant="flat">
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
