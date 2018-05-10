import { SIDE, COUNTRY, BRANCH } from 'wiretap/index'

export interface IGetSvgRoundel {
  side?: SIDE
  country?: COUNTRY
  branch?: BRANCH
}

export const getSvgRoundel = (options: IGetSvgRoundel): string => {
  // tslint:disable max-line-length
  const roundel: any = {
    country: {
      [COUNTRY.GERMANY]:
        '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#CE1126" fill="#FFF"/><circle cx="300" cy="300" r="100"/></svg>',
      [COUNTRY.ENGLAND]:
        '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#092678" fill="#FFF"/><circle cx="300" cy="300" r="100" fill="#BD2C2F"/></svg>',
      [COUNTRY.FRANCE]:
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#B7251A" fill="#FFF"/><circle cx="300" cy="300" r="100" fill="#02115A"/></svg>',
      [COUNTRY.USA]:
        '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><circle fill="#1a1e3b" cx="350" cy="350" r="337.5"/><path fill="#fff" d="M350 12l75.77 233.71h245.86l-199 144.12L548 623.04 350 478.93 147.5 623.04l79.88-233.21-198-144.12h244.85z"/></svg>',
      [`${COUNTRY.GERMANY}.${
        BRANCH.AIR
      }`]: '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#000000" fill="#FFF"/><circle cx="300" cy="300" r="100" fill="#000000"/></svg>',
      [`${COUNTRY.GERMANY}.${
        BRANCH.LAND
      }`]: '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#CE1126" fill="#FFF"/><circle cx="300" cy="300" r="100"/></svg>',
      [`${COUNTRY.GERMANY}.${
        BRANCH.SEA
      }`]: '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#CE1126" fill="#FFF"/><circle cx="300" cy="300" r="100"/></svg>',
      [`${COUNTRY.ENGLAND}.${
        BRANCH.AIR
      }`]: '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#092678" fill="#FFF"/><circle cx="300" cy="300" r="100" fill="#BD2C2F"/></svg>',
      [`${COUNTRY.ENGLAND}.${
        BRANCH.LAND
      }`]: '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="300" fill="#00247d"/><circle cx="300" cy="300" r="150" fill="#ce1126"/></svg>',
      [`${COUNTRY.ENGLAND}.${
        BRANCH.SEA
      }`]: 'PHN2ZyB2ZXJzaW9uPSIxLjAiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48Y2lyY2xlIGN4PSIzMDAiIGN5PSIzMDAiIHI9IjMwMCIgZmlsbD0iIzAwMjQ3ZCIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjMwMCIgcj0iMTUwIiBmaWxsPSIjY2UxMTI2Ii8+PC9zdmc+',
      [`${COUNTRY.FRANCE}.${
        BRANCH.AIR
      }`]: 'PHN2ZyB2ZXJzaW9uPSIxLjAiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48Y2lyY2xlIGN4PSIzMDAiIGN5PSIzMDAiIHI9IjI1MCIgc3Ryb2tlLXdpZHRoPSIxMDAiIHN0cm9rZT0iI0I3MjUxQSIgZmlsbD0iI0ZGRiIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjMwMCIgcj0iMTAwIiBmaWxsPSIjMzI3QkVGIi8+PC9zdmc+',
      [`${COUNTRY.FRANCE}.${
        BRANCH.LAND
      }`]: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#B7251A" fill="#FFF"/><circle cx="300" cy="300" r="100" fill="#02115A"/></svg>',
      [`${COUNTRY.FRANCE}.${
        BRANCH.SEA
      }`]: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#B7251A" fill="#FFF"/><circle cx="300" cy="300" r="100" fill="#02115A"/></svg>',
      [`${COUNTRY.USA}.${
        BRANCH.AIR
      }`]: '<svg xmlns="http://www.w3.org/2000/svg" width="675" height="675"><circle cx="337.5" cy="337.5" r="337.5" fill="#1a1e3b"/><path d="M337.5 0L139.122 610.543l519.36-377.336H16.518l519.36 377.336z" fill="#fff"/><circle cx="337.5" cy="337.5" r="104.293" fill="#de0000"/></svg>',
      [`${COUNTRY.USA}.${
        BRANCH.LAND
      }`]: '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><circle fill="#1a1e3b" cx="350" cy="350" r="337.5"/><path fill="#fff" d="M350 12l75.77 233.71h245.86l-199 144.12L548 623.04 350 478.93 147.5 623.04l79.88-233.21-198-144.12h244.85z"/></svg>',
      [`${COUNTRY.USA}.${
        BRANCH.SEA
      }`]: '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><circle fill="#1a1e3b" cx="350" cy="350" r="337.5"/><path fill="#fff" d="M350 12l75.77 233.71h245.86l-199 144.12L548 623.04 350 478.93 147.5 623.04l79.88-233.21-198-144.12h244.85z"/></svg>',
    },
    side: {
      [SIDE.ALLIED]:
        '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><circle fill="#1a1e3b" cx="350" cy="350" r="337.5"/><path fill="#fff" d="M350 12l75.77 233.71h245.86l-199 144.12L548 623.04 350 478.93 147.5 623.04l79.88-233.21-198-144.12h244.85z"/></svg>',
      [SIDE.AXIS]:
        '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#CE1126" fill="#FFF"/><circle cx="300" cy="300" r="100"/></svg>',
      [`${SIDE.ALLIED}.${
        BRANCH.AIR
      }`]: '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><circle fill="#1a1e3b" cx="350" cy="350" r="337.5"/><path fill="#fff" d="M350 12l75.77 233.71h245.86l-199 144.12L548 623.04 350 478.93 147.5 623.04l79.88-233.21-198-144.12h244.85z"/></svg>',
      [`${SIDE.ALLIED}.${
        BRANCH.LAND
      }`]: '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><circle fill="#1a1e3b" cx="350" cy="350" r="337.5"/><path fill="#fff" d="M350 12l75.77 233.71h245.86l-199 144.12L548 623.04 350 478.93 147.5 623.04l79.88-233.21-198-144.12h244.85z"/></svg>',
      [`${SIDE.ALLIED}.${
        BRANCH.SEA
      }`]: '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><circle fill="#1a1e3b" cx="350" cy="350" r="337.5"/><path fill="#fff" d="M350 12l75.77 233.71h245.86l-199 144.12L548 623.04 350 478.93 147.5 623.04l79.88-233.21-198-144.12h244.85z"/></svg>',
      [`${SIDE.AXIS}.${
        BRANCH.AIR
      }`]: '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#CE1126" fill="#FFF"/><circle cx="300" cy="300" r="100"/></svg>',
      [`${SIDE.AXIS}.${
        BRANCH.SEA
      }`]: '<svg version="1" xmlns="http://www.w3.org/2000/svg" width="600" height="600"><circle cx="300" cy="300" r="250" stroke-width="100" stroke="#CE1126" fill="#FFF"/><circle cx="300" cy="300" r="100"/></svg>',
    },
  }
  // tslint:enable max-line-length

  const type = options.side || options.country
  const typeKey = options.side ? 'side' : 'country'
  const key = options.branch ? `${type}.${options.branch}` : type
  let SVG = ''

  if (key) {
    SVG = roundel[typeKey][key]
  }

  return SVG
}
