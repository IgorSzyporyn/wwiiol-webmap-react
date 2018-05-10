import { IChokePointLink } from 'wiretap/chokePointLink'

const getCpLinks = (id: string, chokePointLinks: IChokePointLink[] = []) => {
  return chokePointLinks.filter((chokePointLink) => chokePointLink.lcp === id)
}

export default getCpLinks
