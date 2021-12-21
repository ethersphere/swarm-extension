import React, { CSSProperties, ReactElement } from 'react'
import { createUseStyles } from 'react-jss'

interface Props {
  style?: CSSProperties
}

const useStyles = createUseStyles({
  root: {
    width: 88,
    height: 30,
  },
})

const Logo = ({ style }: Props): ReactElement => {
  const classes = useStyles()

  return (
    <svg className={classes.root} style={style} viewBox="0 0 88 30" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fill-rule="evenodd">
        <path d="M0 0h88v30H0z" />
        <path
          d="m5.064 14.685 4.822 2.709v5.4L5.064 25.5l-4.82-2.706v-5.4l4.82-2.71zm11.034 0 4.822 2.709v5.4L16.098 25.5l-4.82-2.706v-5.4l4.82-2.71zm42.17-3.332v7.644l1.655 1.432.017-.014-1.187 1.327h-.019l-2.097-1.815-2.505 1.465c-.41.237-.876.362-1.35.357a2.828 2.828 0 0 1-1.91-.762 2.601 2.601 0 0 1-.824-1.95 2.702 2.702 0 0 1 1.367-2.356l5.05-2.895v-.644H50.55v-1.79h7.719zm-29.357.085c.802-.392 1.705-.529 2.588-.392.845.17 1.627.57 2.258 1.159.166.145.443.417.632.606l.122.121.08.08-1.178 1.336c.014-.017-.801-.773-.883-.841a3.087 3.087 0 0 0-1.383-.754 2.107 2.107 0 0 0-1.573.27 1.004 1.004 0 0 0-.484.928c.006.372.213.71.54.885.547.291 1.136.49 1.747.586.387.075.766.172 1.102.261.335.088.662.21.974.359.314.11.602.285.844.515.233.194.416.438.537.715.152.298.232.626.236.96a2.925 2.925 0 0 1-1.17 2.444c-.81.602-1.8.911-2.809.876-.379.002-.76-.036-1.131-.114a5.59 5.59 0 0 1-2.652-1.506c-.05-.043-.608-.566-.608-.566l1.145-1.378c.246.23.486.462.741.677.313.303.655.574 1.02.813a2.991 2.991 0 0 0 2.948 0c.375-.227.596-.638.58-1.074a.82.82 0 0 0-.569-.799 9.011 9.011 0 0 0-1.979-.59 6.2 6.2 0 0 1-2.408-.978c-.602-.433-.895-1.095-.895-2.025a2.71 2.71 0 0 1 1.03-2.183 3.35 3.35 0 0 1 .598-.39zm17.705-.135c0-.022.006.006.006.006h1.922l-1.606 10.212h-3.152l-1.15-8.808h-.024l-1.164 8.804H38.3l-1.573-10.214h1.926l1.267 8.822h.024l1.114-8.822h3.157l1.109 8.822h.025zm33.488-.29a2.337 2.337 0 0 1 1.858.765c.435.557.655 1.252.618 1.958v7.76h-1.89V14.08a1.759 1.759 0 0 0-.288-.886.988.988 0 0 0-.873-.359 1.154 1.154 0 0 0-.936.427c-.272.41-.4.9-.357 1.391v6.854h-1.88v-7.337a1.454 1.454 0 0 0-.317-.976 1.021 1.021 0 0 0-.824-.359 1.122 1.122 0 0 0-.966.448c-.253.366-.379.808-.358 1.252v6.978h-1.876v-10.21h1.876v.946c.153-.354.401-.657.715-.877.38-.245.821-.37 1.272-.358.465-.02.923.124 1.296.404.304.244.535.57.664.937a2.416 2.416 0 0 1 2.266-1.341zm-13.503-.011a3.262 3.262 0 0 1 2.387.996 3.247 3.247 0 0 1 1.023 2.393v.588h-1.764v-.588a1.59 1.59 0 0 0-1.743-1.582 1.65 1.65 0 0 0-1.431 1.668v5.205h2.574v1.764H61.56v-1.764h1.687v-5.62l-1.697-1.538 1.178-1.315 1.195 1.096a3.22 3.22 0 0 1 2.677-1.303zm-10.136 4.89L52.32 18.27a.883.883 0 0 0-.46.789c.01.496.41.894.905.905a.894.894 0 0 0 .468-.143h-.022l3.254-1.89v-2.04zM10.544 5.254l1.847 1.102v3.181l.634.354 2.347 1.318v2.15l-4.82 2.707-4.82-2.706v-5.4l4.812-2.706zm5.638-.755 2.568 1.44v2.886l-2.548 1.428-.02-.011-2.553-1.43V5.951l.005-.021L16.182 4.5z"
          fill="#F9F9F9"
        />
      </g>
    </svg>
  )
}

export default Logo
