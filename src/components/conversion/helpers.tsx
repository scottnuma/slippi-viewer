import React from "react";

interface ForProps {
    each: any
    children: (item: any, index: number) => any
}

export function For(props: ForProps) {
    return (
        <>
            {props.each.map((item: any, index: number) => (
                <React.Fragment key={index}>
                    {props.children(item, index)}
                </React.Fragment>
            ))}
        </>
    )
}

export function Show(props: { when: boolean; children: any, fallback?: any }) {
    return props.when ? props.children : props.fallback
}

export function Switch(props: { children: any }) {
    return props.children
}

export function Match(props: { when: boolean; children: any }) {
    return props.when ? props.children : null
}