import React, { MouseEventHandler } from 'react'
import classNames from 'classnames'

interface Props {
  width?: number
  height?: number
}

function _Edit (props: Props) {
  return (
    <svg width={props.width} height={props.height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="currentcolor" stroke="currentcolor" strokeWidth="4" strokeLinejoin="round"/>
    </svg>
  )
}

function _Earth (props: Props) {
  return (
    <svg width={props.width} height={props.height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="currentcolor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 24H44" stroke="currentcolor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M24 44C28.4183 44 32 35.0457 32 24C32 12.9543 28.4183 4 24 4C19.5817 4 16 12.9543 16 24C16 35.0457 19.5817 44 24 44Z" stroke="currentcolor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.85791 10.1421C13.4772 13.7614 18.4772 16 24 16V16C29.5229 16 34.5229 13.7614 38.1422 10.1421" stroke="currentcolor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M38.1422 37.8579C34.5229 34.2386 29.5229 32 24 32C18.4772 32 13.4772 34.2386 9.85791 37.8579" stroke="currentcolor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function _Tag (props: Props) {
  return (
    <svg width={props.width} height={props.height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42.1691 29.2451L29.2631 42.1511C28.5879 42.8271 27.6716 43.2069 26.7161 43.2069C25.7606 43.2069 24.8444 42.8271 24.1691 42.1511L8 26V8H26L42.1691 24.1691C43.5649 25.5732 43.5649 27.841 42.1691 29.2451Z" fill="currentcolor" stroke="#333" strokeWidth="4" strokeLinejoin="round"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M18.5 21C19.8807 21 21 19.8807 21 18.5C21 17.1193 19.8807 16 18.5 16C17.1193 16 16 17.1193 16 18.5C16 19.8807 17.1193 21 18.5 21Z" fill="currentcolor"/>
    </svg>
  )
}

type IconProps = Props & { className?: string, onClick?: MouseEventHandler, href?: string }

export default function Icon (Component: React.FunctionComponent<Props>, props: IconProps) {
  const { className, onClick, href, width, height } = props
  const classes = classNames('i i-btn', className)
  return (onClick
    ? <button className={classes} onClick={onClick}>
        <Component width={width || 14} height={height || 14} />
      </button>
    : <a className={classes} href={href} target="_blank">
        <Component width={width || 14} height={height || 14} />
      </a>
  )
}

export const Edit = (props: IconProps) => Icon(_Edit, props)
export const Earth = (props: IconProps) => Icon(_Earth, props)
export const Tag = (props: IconProps) => Icon(_Tag, props)
