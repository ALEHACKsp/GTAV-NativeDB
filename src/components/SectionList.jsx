import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useCallback } from 'react'

const useStyle = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    overflowY: 'auto',
  }
})

export default React.memo(({ data, renderItem, renderHeader, itemHeight, headerHeight }) => {
  const classes = useStyle()
  const containerRef = useRef()
  const [state, setState] = useState({
    firstItem: 0,
    items: []
  })
  const [sectionHeights, setSectionHeights] = useState([])

  useEffect(() => {
    if (!Array.isArray(data)) {
      return
    }
    setSectionHeights(
      data.map(section => headerHeight + (section.natives.length * itemHeight))
    )
  }, [data, itemHeight, headerHeight])

  const generateItems = (scroll) => {
    const newItems = []
    let totalHeight = 0
    
    console.log(scroll, sectionHeights)

    let i = 0
    for (const height of sectionHeights) {
      if (totalHeight > (scroll + 200)) {
        break
      }
      else if ((totalHeight + height) >= scroll) {
        for (let j = Math.floor(((scroll - totalHeight) / itemHeight)); j < Math.min((200 / itemHeight), data[i].natives.length); ++j) {
          console.log(data[i].natives, j, totalHeight, i)
          newItems.push(
            renderItem(data[i].natives[j], {
              position: 'aboslute',
              top: (totalHeight + (j * itemHeight))
            })
          )
        }
      }

      totalHeight += height
      ++i
    }

    setState({
      items: newItems,
    })
  }

  useEffect(() => {
    generateItems(0)
  }, [generateItems, data])

  const onScroll = useCallback((event) => {
    const scroll = event.target.scrollTop
    
    generateItems(scroll)
  }, [generateItems])

  return (
    <div 
      className={classes.container} 
      ref={containerRef}
      onScroll={onScroll}
    >
      {state.items}
    </div>
  )
})
