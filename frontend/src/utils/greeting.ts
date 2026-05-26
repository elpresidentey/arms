type GreetingUser = {
  firstName?: string
  lastName?: string
}

export const getTimeOfDayGreeting = (date = new Date()) => {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  }

  if (hour >= 12 && hour < 17) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

const formatNamePart = (value?: string) => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

export const getResidentDisplayName = (user?: GreetingUser | null) => {
  const lastName = formatNamePart(user?.lastName)
  const firstName = formatNamePart(user?.firstName)

  if (lastName) {
    return `Mr. ${lastName}`
  }

  if (firstName) {
    return firstName
  }

  return ''
}

export const getResidentDashboardGreeting = (user?: GreetingUser | null, date = new Date()) => {
  const timeGreeting = getTimeOfDayGreeting(date)
  const name = getResidentDisplayName(user)

  if (!name) {
    return timeGreeting
  }

  return `${timeGreeting}, ${name}`
}
