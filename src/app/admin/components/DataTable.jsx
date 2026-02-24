import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Checkbox,
    Box,
    Typography,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

export default function DataTable({
    columns,
    data,
    loading = false,
    total = 0,
    page = 0,
    rowsPerPage = 10,
    onPageChange,
    onRowsPerPageChange,
    onRowClick,
    onRefresh,
    onFilter,
    selectable = false,
    selectedRows = [],
    onSelectRow,
    onSelectAll,
    emptyMessage = 'No data found'
}) {
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAll = (event) => {
        if (onSelectAll) {
            onSelectAll(event.target.checked);
        }
    };

    const handleSelectRow = (event, id) => {
        if (onSelectRow) {
            onSelectRow(event.target.checked, id);
        }
    };

    return (
        <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
            {/* Toolbar */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {total} {total === 1 ? 'item' : 'items'} total
                </Typography>
                <Box>
                    {onFilter && (
                        <Tooltip title="Filter">
                            <IconButton onClick={onFilter} size="small" sx={{ mr: 1 }}>
                                <FilterIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onRefresh && (
                        <Tooltip title="Refresh">
                            <IconButton onClick={onRefresh} size="small">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {/* Loading bar */}
            {loading && <LinearProgress sx={{ height: 2 }} />}

            {/* Table */}
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {selectable && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                                        checked={data.length > 0 && selectedRows.length === data.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                            )}
                            {columns.map((column) => (
                                <TableCell
                                    key={column.field}
                                    align={column.align || 'left'}
                                    style={{ minWidth: column.minWidth, width: column.width }}
                                    sortDirection={orderBy === column.field ? order : false}
                                >
                                    {column.sortable ? (
                                        <TableSortLabel
                                            active={orderBy === column.field}
                                            direction={orderBy === column.field ? order : 'asc'}
                                            onClick={() => handleRequestSort(column.field)}
                                        >
                                            {column.header}
                                        </TableSortLabel>
                                    ) : (
                                        column.header
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    
                    <TableBody>
                        {loading ? (
                            // Loading skeleton
                            Array.from(new Array(rowsPerPage)).map((_, index) => (
                                <TableRow key={index}>
                                    {selectable && <TableCell padding="checkbox"><Checkbox disabled /></TableCell>}
                                    {columns.map((column) => (
                                        <TableCell key={column.field}>
                                            <Box sx={{ height: 20, bgcolor: '#f0f0f0', borderRadius: 1 }} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            // Empty state
                            <TableRow>
                                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 8 }}>
                                    <Typography color="#999">{emptyMessage}</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Data rows
                            data.map((row, index) => (
                                <TableRow
                                    hover
                                    key={row.id || index}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                >
                                    {selectable && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedRows.includes(row.id)}
                                                onChange={(e) => handleSelectRow(e, row.id)}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => {
                                        const value = row[column.field];
                                        return (
                                            <TableCell key={column.field} align={column.align || 'left'}>
                                                {column.render ? column.render(row) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
            />
        </Paper>
    );
}