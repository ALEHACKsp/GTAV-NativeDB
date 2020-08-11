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
    overflowX: 'hidden',
  }
})

export default React.memo(({ data, renderItem, renderHeader, itemHeight, headerHeight }) => {
  const classes = useStyle()
  const containerRef = useRef()
  const [items, setItems] = useState([])
  const [sectionHeights, setSectionHeights] = useState([])
  const [totalHeight, setTotalHeight] = useState(0)
  const containerHeight = containerRef.current?.offsetHeight + headerHeight

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
      if (totalHeight > (scroll + containerHeight)) {
        break
      }
      else if ((totalHeight + height) >= (scroll - headerHeight)) {
        if ((scroll + headerHeight) >= totalHeight) {
          const end = (totalHeight + height) - (headerHeight * 2)
          newItems.push(
            renderHeader(data[i], {
              position: (scroll >= end) ? 'absolute' : 'sticky',
              top: (scroll >= end) ? end : 0,
              width: '100%',
            })
          )
        }
        else {
          newItems.push(
            renderHeader(data[i], {
              position: 'absolute',
              top: (totalHeight - headerHeight),
              width: '100%',
            })
          )
        }

        let firstItem = Math.max(0, Math.floor(((scroll - totalHeight) / itemHeight)))
        for (let j = firstItem; j < Math.min(firstItem + (containerHeight / itemHeight), data[i].natives.length); ++j) {
          newItems.push(
            renderItem(data[i].natives[j], {
              position: 'absolute',
              top: (totalHeight + (j * itemHeight)),
              width: '100%',
            })
          )
        }
      }

      totalHeight += height
      ++i
    }

    setItems(newItems)
  }, [data, renderItem, itemHeight, sectionHeights, containerHeight])

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
      <div style={{ position: 'relative', height: totalHeight, width: '100%', }}>
        {items}
      </div>
    </div>
  )
})
