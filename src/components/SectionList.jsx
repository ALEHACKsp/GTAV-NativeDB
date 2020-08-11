import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useCallback } from 'react'

const useStyle = makeStyles({
  container: {
    width: '100%',
    height: '200px',
    overflowY: 'auto',
  }
})

export default React.memo(({ data, renderItem, renderHeader, itemHeight, headerHeight }) => {
  const classes = useStyle()
  const containerRef = useRef()
  const [items, setItems] = useState([])
  const [sectionHeights, setSectionHeights] = useState([])
  const [totalHeight, setTotalHeight] = useState(0)

  useEffect(() => {
    if (!Array.isArray(data)) {
      return
    }
    const heights = data.map(section => headerHeight + (section.natives.length * itemHeight))
    const total = heights.reduce((accumulator, height) => accumulator += height, 0)
    setSectionHeights(heights)
    setTotalHeight(total)
  }, [data, itemHeight, headerHeight])

  const generateItems = React.useCallback((scroll) => {
    const newItems = []
    let totalHeight = headerHeight
    
    let i = 0
    for (const height of sectionHeights) {
      if (totalHeight > (scroll + 200)) {
        break
      }
      else if ((totalHeight + height) >= scroll) {
        newItems.push(
          renderHeader(data[i], {
            position: 'absolute',
            top: (totalHeight - headerHeight)
          })
        )

        let firstItem = Math.max(0, Math.floor(((scroll - totalHeight) / itemHeight)))
        for (let j = firstItem; j < Math.min(firstItem + (200 / itemHeight), data[i].natives.length); ++j) {
          newItems.push(
            renderItem(data[i].natives[j], {
              position: 'absolute',
              top: (totalHeight + (j * itemHeight))
            })
          )
        }
      }

      totalHeight += height
      ++i
    }

    setItems(newItems)
  }, [data, renderItem, itemHeight, sectionHeights])

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
      <div style={{ position: 'relative', height: totalHeight }}>
        {items}
      </div>
    </div>
  )
})
