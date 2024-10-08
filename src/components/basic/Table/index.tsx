/********************************************************************************
 * Copyright (c) 2023 BMW Group AG
 * Copyright (c) 2023 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ********************************************************************************/

import { useCallback } from 'react'
import {
  DataGrid,
  type GridRowSelectionModel,
  type DataGridProps,
  type GridRowId,
} from '@mui/x-data-grid'
import { Box, Stack } from '@mui/material'
import { StatusTag } from './components/StatusTag'
import { Toolbar, type ToolbarProps } from './components/Toolbar'
import { UltimateToolbar } from './components/Toolbar/UltimateToolbar'
import { theme } from '../../../theme'
import { SearchAndFilterButtonToolbar } from './components/Toolbar/SearchAndFilterButtonToolbar'
import { Typography } from '../Typography'
import { Error500Overlay } from './components/Error/Error500Overlay'
import { Error400Overlay } from './components/Error/Error400Overlay'
import type { View } from '../ViewSelector'
import { type SortOptionsType } from '../SortOption'
import { LoadMoreButton } from '../Button/LoadMoreButton'

export { StatusTag }
export type toolbarType = 'basic' | 'premium' | 'ultimate' | 'searchAndFilter'
export interface SearchInputState {
  open: boolean
  text: string
}

export interface TableProps extends DataGridProps {
  title: string
  rowsCount?: number
  rowsCountMax?: number
  toolbarVariant?: toolbarType
  toolbar?: ToolbarProps
  columnHeadersBackgroundColor?: string
  onSearch?: (value: string) => void
  searchExpr?: string
  searchPlaceholder?: string
  searchDebounce?: number
  searchInputData?: SearchInputState
  noRowsMsg?: string
  hasBorder?: boolean
  buttonLabel?: string
  onButtonClick?: React.MouseEventHandler
  buttonDisabled?: boolean
  buttonTooltip?: string
  secondButtonLabel?: string
  onSecondButtonClick?: React.MouseEventHandler
  onSelection?: (value: GridRowId[]) => void
  descriptionText?: string
  defaultFilter?: string
  filterViews?: View[]
  defaultSortOption?: string
  sortOptions?: SortOptionsType[]
  onSortClick?: (value: string) => void
  alignCell?: string
  fontSizeCell?: string
  error?: {
    status: number
    message?: string
  } | null
  reload?: () => void
  autoFocus?: boolean
  hasMore?: boolean
  loadLabel?: string
  nextPage?: () => void
}

export const Table = ({
  columns,
  rows,
  autoHeight = true,
  columnHeaderHeight = 57, // Default header height from base design
  rowHeight = 57, // Default row height from base design
  rowsCount = 0,
  rowsCountMax = 0,
  title,
  toolbarVariant = 'basic',
  toolbar,
  checkboxSelection,
  columnHeadersBackgroundColor = '#E9E9E9',
  onSearch,
  searchExpr,
  searchPlaceholder,
  searchDebounce,
  searchInputData,
  noRowsMsg,
  hasBorder = true,
  buttonLabel,
  onButtonClick,
  buttonDisabled,
  buttonTooltip,
  secondButtonLabel,
  onSecondButtonClick,
  onSelection,
  descriptionText,
  defaultFilter,
  filterViews,
  defaultSortOption,
  sortOptions,
  onSortClick,
  alignCell = 'center',
  fontSizeCell = '14px',
  error,
  reload,
  autoFocus = true,
  hasMore = false,
  loadLabel = 'load more',
  nextPage,
  ...props
}: TableProps) => {
  const toolbarProps = {
    rowsCount,
    rowsCountMax,
    onSearch,
    searchDebounce,
    searchInputData,
    searchPlaceholder,
    noRowsMsg,
    buttonLabel,
    onButtonClick,
    buttonDisabled,
    buttonTooltip,
    secondButtonLabel,
    onSecondButtonClick,
    onSelection,
    searchExpr,
    descriptionText,
    defaultFilter,
    filterViews,
    defaultSortOption,
    sortOptions,
    onSortClick,
    autoFocus,
  }

  // TODO: this method contains application specific row attributes and must therefore
  // move out of the shared components. Pass handler functions like this as props.
  const handleOnCellClick = useCallback(
    (selectedIds: GridRowSelectionModel) => {
      const idsArr: string[] = []
      rows.map((row) => {
        return selectedIds.map(
          (selectedId: GridRowId) =>
            selectedId.toString().includes(row.companyUserId) &&
            idsArr.push(row.companyUserId)
        )
      })
      onSelection?.(idsArr)
    },
    [rows, onSelection]
  )

  const toolbarView = () => {
    switch (toolbarVariant) {
      case 'basic':
        return <Toolbar title={title} {...toolbarProps} />
      case 'premium':
        return <Toolbar title={title} {...toolbar} {...toolbarProps} />
      case 'ultimate':
        return <UltimateToolbar title={title} {...toolbarProps} {...toolbar} />
      case 'searchAndFilter':
        return <SearchAndFilterButtonToolbar {...toolbarProps} {...toolbar} />
    }
  }

  const renderErrorMessage = () => {
    if (error == null) {
      return <Typography variant="body2">{noRowsMsg ?? 'No rows'}</Typography>
    }
    if (error.status >= 400 && error.status < 500) {
      return <Error400Overlay errorMessage4xx={error.message} />
    }
    return (
      <Error500Overlay
        reload={() => {
          reload?.()
        }}
        errorMessage5xx={error.message}
      />
    )
  }

  const NoRowsOverlay = () => {
    return (
      <Stack
        height="100%"
        alignItems="center"
        justifyContent="center"
        sx={{ backgroundColor: '#fff', pointerEvents: 'auto' }}
      >
        {renderErrorMessage()}
      </Stack>
    )
  }

  return (
    <>
      <Box
        className="cx-table"
        sx={{
          '.MuiDataGrid-columnHeaders': {
            backgroundColor: columnHeadersBackgroundColor,
          },
          '.MuiDataGrid-root': {
            border: hasBorder
              ? `1px solid ${theme.palette.border.border01}`
              : 'none',
          },
        }}
      >
        <DataGrid
          sx={{
            '&.MuiDataGrid-root .MuiDataGrid-cell': {
              alignItems: alignCell,
              fontSize: fontSizeCell,
            },
            '&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus-within':
              {
                outline: 'none',
              },
          }}
          // eslint-disable-next-line
          getRowId={(row) => row.id}
          components={{
            Toolbar: () => toolbarView(),
            NoRowsOverlay,
          }}
          onRowSelectionModelChange={handleOnCellClick}
          {...{
            rows,
            columns,
            autoHeight,
            columnHeaderHeight,
            rowHeight,
            checkboxSelection,
          }}
          {...props}
        />
      </Box>
      {rows.length > 0 && hasMore ? (
        <Box
          className="cx-table__page-loading--loader"
          sx={{
            width: '100%',
            height: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LoadMoreButton label={loadLabel} onClick={nextPage} />
        </Box>
      ) : (
        <></>
      )}
    </>
  )
}
