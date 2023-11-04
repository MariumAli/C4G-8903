import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@nextui-org/react";
import NavItem from "@/components/NavItem";
import Image from "next/image";



const MENU_LIST = [
  { text: "Home", href: "/" },
  { text: "About", href: "/about" },
  { text: "Audit", href: "/audit" },
  { text: "Users", href: "/users" },
];

export default function NavigationBar() {
  const [navActive, setNavActive] = useState(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const { data: session } = useSession();

  return (
    <header>
      <nav className={`nav`}>
      <img src="/UWALogo.png" width="10%" height="10%" />
        <p className="font-extrabold text-2xl capitalize font-mono">UNITED WAY OF METRO ATLANTA: EFSP DASHBOARD</p>
        <div
          onClick={() => setNavActive(!navActive)}
          className={`nav__menu-bar`}
        >
          <div></div>
          <div></div>
        </div>

        <div className={`${navActive ? "active font-bold" : ""} nav__menu-list`}>
          {MENU_LIST.map((menu, idx) => (
            <div onClick={() => { setActiveIdx(idx); setNavActive(false); }} className={activeIdx === idx ? "active font-bold" : ""} key={menu.text}>
              <NavItem className={activeIdx === idx ? "active font-bold" : ""} active={activeIdx === idx} {...menu} />
            </div>
          ))}



          {session ? (
            <div>
              <Button onClick={() => signOut()} color="danger" variant="flat">
                Sign Out
              </Button>
            </div>
          ) : (

            <div>
              <Button onClick={() => signIn()} color="primary" variant="flat">
                Sign In
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
