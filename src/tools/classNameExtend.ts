const classNameExtend = (classNamesA = '', classNamesB = '') => {
  const aclassNamesA = classNamesA.split(' ')
  const aClassNames = classNamesB.split(' ')

  aClassNames.forEach((name: any) => aclassNamesA.push(name))
  return aclassNamesA.join(' ')
}

export default classNameExtend
