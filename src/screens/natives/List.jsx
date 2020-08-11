import React, { useState, useEffect, useCallback } from 'react'
import { NativeListItem, NamespaceHeader, SectionList } from '../../components'
import { useSelector } from 'react-redux'
import { StickyTree } from 'react-virtualized-sticky-tree'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useParams } from 'react-router-dom'
import { useAppBar } from '../../components/AppBarProvider'
import { Portal } from '@material-ui/core'
import NamespaceSelect from './NamespaceSelect'

export default React.memo(() => {
  const namespaces = useSelector(store => store.search)
  const [namespaceData, setNamespaceData] = useState({})
  const selectedNative = useSelector(({ natives }) => natives[useParams()['native']]) ?? {}
  const [ scroll, setScroll ] = useState(-1)
  const [ hasScrolledToNative, setHasScrolledToNative ] = useState(false)
  const [ listLoaded, setListLoaded] = useState(false)
  const { toolbar } = useAppBar()

  useEffect(() => {
    if (listLoaded && Object.keys(namespaces).length) {
      setScroll(0)
    }
  }, [namespaces, listLoaded])
  
  useEffect(() => {
    if (listLoaded && scroll !== -1) {
      setScroll(-1)
    }
  }, [scroll, listLoaded])

  useEffect(() => {
    if (hasScrolledToNative || !Object.keys(namespaces).length || !listLoaded) {
      return
    }

    let result = -1
    for (const ns in namespaces) {
      if (ns === selectedNative.namespace) {
        result += 3 + namespaces[ns].natives.findIndex(hash => hash === selectedNative.hash)
        setScroll(result)
        setHasScrolledToNative(true)
        break
      }
      result += namespaces[ns]?.natives?.length + 1
    }
  }, [selectedNative, hasScrolledToNative, namespaces, scroll, listLoaded])

  useEffect(() => {
    const result = Object.values(namespaces).reduce((accumulator, namespace) => {
      accumulator[namespace.name] = namespace.natives.map(hash => ({
        id: hash,
        height: 28,
        isSticky: false,
      }))
      return accumulator
    }, {})

    setNamespaceData(result)
  }, [namespaces])

  const renderItem = useCallback((id, style) => {
    return (
      <div style={style} key={id}>
        <NativeListItem
          hash={id}
        />
      </div>
    )
  }, [namespaces, listLoaded])

  const renderHeader = useCallback(({ name }, style) => {
    return (
      <NamespaceHeader 
        name={name} 
        style={style}
        key={name}
      />
    )
  })

  const gotoNamespace = useCallback((namespace) => {
    let result = -1
    for (const ns in namespaces) {
      if (ns === namespace) {
        result += 3
        setScroll(result)
        break
      }
      result += namespaces[ns].natives.length + 1
    }
  }, [namespaces])

  return (
    <React.Fragment>
      <Portal container={toolbar.current}>
        <NamespaceSelect 
          onSelect={gotoNamespace}
        />
      </Portal>
      <SectionList
        data={Object.values(namespaces)}
        headerHeight={73}
        itemHeight={28}
        renderItem={renderItem}
        renderHeader={renderHeader}
      />
    </React.Fragment>
  )
})
