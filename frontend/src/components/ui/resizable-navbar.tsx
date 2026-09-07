"use client";
import { cn } from "../../lib/utils";
import { Menu, X } from "lucide-react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import { NavLink } from "react-router-dom";

import React, { useRef, useState } from "react";

interface NavbarProps {
    children: React.ReactNode;
    className?: string;
}

interface NavBodyProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface NavItemsProps {
    items: {
        title: string;
        href: string;
    }[];
    className?: string;
    onItemClick?: () => void;
}

interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface MobileNavHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface MobileNavMenuProps {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const [visible, setVisible] = useState<boolean>(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    });

    return (
        <motion.div
            ref={ref}
            className={cn("sticky inset-x-0 top-0 z-50 w-full", className)}
        >
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(
                        child as React.ReactElement<{ visible?: boolean }>,
                        { visible },
                    )
                    : child,
            )}
        </motion.div>
    );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(12px)" : "none",
                boxShadow: visible
                    ? "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 3px rgba(0,0,0,0.02)"
                    : "none",
                width: visible ? "65%" : "100%",
                y: visible ? 16 : 0,
                borderRadius: visible ? "9999px" : "0px",
                backgroundColor: visible ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 1)",
                borderBottomColor: visible ? "transparent" : "var(--color-neutral-200)",
                borderColor: visible ? "var(--color-neutral-200)" : "transparent",
                borderWidth: visible ? "1px" : "0px",
                borderBottomWidth: visible ? "1px" : "1px",
            }}
            transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
            }}
            style={{
                minWidth: visible ? "700px" : "100%",
            }}
            className={cn(
                "relative z-[60] mx-auto hidden flex-row items-center justify-between self-start px-4 sm:px-6 lg:px-8 py-3 lg:flex transition-colors",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <motion.div
            onMouseLeave={() => setHovered(null)}
            className={cn(
                "hidden flex-1 flex-row items-center justify-center space-x-2 text-[var(--text-label)] font-[600] text-[var(--color-neutral-600)] transition duration-200 lg:flex",
                className,
            )}
        >
            {items.map((item, idx) => (
                <NavLink
                    onMouseEnter={() => setHovered(idx)}
                    onClick={onItemClick}
                    className={({ isActive }) =>
                        cn(
                            "relative px-4 py-2 hover:text-[var(--color-primary-700)] transition-colors rounded-full",
                            isActive && item.href !== "/" ? "text-[var(--color-primary-600)]" : ""
                        )
                    }
                    key={`link-${idx}`}
                    to={item.href}
                >
                    {hovered === idx && (
                        <motion.div
                            layoutId="hovered"
                            className="absolute inset-0 h-full w-full rounded-full bg-[var(--color-primary-50)]"
                        />
                    )}
                    <span className="relative z-20">{item.title}</span>
                </NavLink>
            ))}
        </motion.div>
    );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(12px)" : "none",
                boxShadow: visible
                    ? "0 4px 20px -2px rgba(0, 0, 0, 0.05)"
                    : "none",
                width: visible ? "92%" : "100%",
                borderRadius: visible ? "24px" : "0px",
                y: visible ? 16 : 0,
                backgroundColor: visible ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 1)",
                borderBottomColor: visible ? "transparent" : "var(--color-neutral-200)",
                borderColor: visible ? "var(--color-neutral-200)" : "transparent",
                borderWidth: visible ? "1px" : "0px",
                borderBottomWidth: visible ? "1px" : "1px",
            }}
            transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
            }}
            className={cn(
                "relative z-50 mx-auto flex flex-col items-center justify-between px-4 py-3 lg:hidden",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const MobileNavHeader = ({
    children,
    className,
}: MobileNavHeaderProps) => {
    return (
        <div
            className={cn(
                "flex w-full flex-row items-center justify-between",
                className,
            )}
        >
            {children}
        </div>
    );
};

export const MobileNavMenu = ({
    children,
    className,
    isOpen,
}: MobileNavMenuProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "absolute inset-x-0 top-[100%] mt-2 z-50 flex w-full flex-col items-start justify-start gap-2 rounded-[var(--radius-xl)] bg-white px-4 py-6 shadow-[var(--shadow-e3)] border border-[var(--color-neutral-100)]",
                        className,
                    )}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const MobileNavToggle = ({
    isOpen,
    onClick,
}: {
    isOpen: boolean;
    onClick: () => void;
}) => {
    return (
        <button 
            onClick={onClick}
            className="inline-flex items-center justify-center p-2 rounded-md text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] focus:outline-none transition-colors"
        >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
    );
};
