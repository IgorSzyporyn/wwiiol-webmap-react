import * as React from 'react'
import './index.scss'

interface IProps {
  country: string
}

const Roundel: React.SFC<IProps> = (props: IProps) => (
  <div className={`Roundel Roundel--${props.country}`} />
)

export default Roundel
