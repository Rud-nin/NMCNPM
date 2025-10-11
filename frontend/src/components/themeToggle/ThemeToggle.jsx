import { useEffect, useState } from 'react'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  const svgMoon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      className="icon"
      width="20"
      height="20"
    >
      <path d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z" />
    </svg>
  )

  const svgSun = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="icon"
      width="15"
      height="15"
    >
      <path d="M120.234 154.188C124.906 158.875 131.062 161.219 137.203 161.219S149.484 158.875 154.172 154.188C163.547 144.812 163.547 129.625 154.172 120.25L108.922 74.969C99.578 65.594 84.359 65.594 74.984 74.969S65.609 99.531 74.984 108.906L120.234 154.188ZM256 112C269.25 112 280 101.25 280 88V24C280 10.75 269.25 0 256 0S232 10.75 232 24V88C232 101.25 242.75 112 256 112ZM112 256C112 242.75 101.25 232 88 232H24C10.75 232 0 242.75 0 256S10.75 280 24 280H88C101.25 280 112 269.25 112 256ZM374.797 161.219C380.937 161.219 387.094 158.875 391.766 154.187L437.016 108.906C446.391 99.531 446.391 84.344 437.016 74.969S412.422 65.594 403.078 74.969L357.828 120.25C348.453 129.625 348.453 144.812 357.828 154.187C362.516 158.875 368.656 161.219 374.797 161.219ZM256 400C242.75 400 232 410.75 232 424V488C232 501.25 242.75 512 256 512S280 501.25 280 488V424C280 410.75 269.25 400 256 400ZM120.234 357.812L74.984 403.094C65.609 412.469 65.609 427.656 74.984 437.031C79.672 441.719 85.812 444.063 91.953 444.063S104.25 441.719 108.922 437.031L154.172 391.75C163.547 382.375 163.547 367.188 154.172 357.812S129.578 348.438 120.234 357.812ZM488 232H424C410.75 232 400 242.75 400 256S410.75 280 424 280H488C501.25 280 512 269.25 512 256S501.25 232 488 232ZM391.766 357.812C382.422 348.437 367.203 348.437 357.828 357.812S348.453 382.375 357.828 391.75L403.078 437.031C407.75 441.719 413.906 444.063 420.047 444.063S432.328 441.719 437.016 437.031C446.391 427.656 446.391 412.469 437.016 403.094L391.766 357.812ZM256 144C194.145 144 144 194.143 144 256C144 317.855 194.145 368 256 368S368 317.855 368 256C368 194.143 317.855 144 256 144Z" />
    </svg>
  )

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    document.documentElement.classList.add('theme-transitions')
    const savedTheme = localStorage.getItem('theme')
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const currentTheme = savedTheme || (preferDark ? 'dark' : 'light')

    setTheme(currentTheme)
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [])

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <div className="theme-slider">
        <span className="theme-icon">
          {theme === 'light' ? svgSun : svgMoon}
        </span>
      </div>
    </div>
  )
}
