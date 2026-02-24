import React, { useState } from 'react';
import {
    Paper,
    Grid,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Box,
    IconButton,
    Collapse
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

export default function FilterBar({
    filters = [],
    values = {},
    onChange,
    onApply,
    onReset,
    loading = false,
    expandable = false
}) {
    const [expanded, setExpanded] = useState(!expandable);

    const handleChange = (field, value) => {
        onChange({ ...values, [field]: value });
    };

    const handleClear = (field) => {
        const newValues = { ...values };
        delete newValues[field];
        onChange(newValues);
    };

    const handleReset = () => {
        if (onReset) {
            onReset();
        } else {
            onChange({});
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterIcon sx={{ color: '#C00C0C', mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                    Filters
                </Typography>
                {expandable && (
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                )}
            </Box>

            <Collapse in={expanded}>
                <Grid container spacing={2} alignItems="center">
                    {filters.map((filter) => (
                        <Grid item xs={12} md={filter.fullWidth ? 12 : 3} key={filter.field}>
                            {filter.type === 'select' ? (
                                <FormControl fullWidth size="small">
                                    <InputLabel>{filter.label}</InputLabel>
                                    <Select
                                        value={values[filter.field] || ''}
                                        onChange={(e) => handleChange(filter.field, e.target.value)}
                                        label={filter.label}
                                        endAdornment={
                                            values[filter.field] && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleClear(filter.field)}
                                                    sx={{ mr: 2 }}
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            )
                                        }
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {filter.options?.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={filter.label}
                                    value={values[filter.field] || ''}
                                    onChange={(e) => handleChange(filter.field, e.target.value)}
                                    placeholder={filter.placeholder}
                                    type={filter.type || 'text'}
                                    InputProps={{
                                        startAdornment: filter.icon,
                                        endAdornment: values[filter.field] && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleClear(filter.field)}
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    }}
                                />
                            )}
                        </Grid>
                    ))}

                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={onApply}
                                disabled={loading}
                                startIcon={<SearchIcon />}
                                sx={{ bgcolor: '#C00C0C' }}
                            >
                                Apply
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleReset}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Active filters chips */}
                {Object.keys(values).length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Object.entries(values).map(([key, value]) => {
                            if (!value) return null;
                            const filter = filters.find(f => f.field === key);
                            return (
                                <Chip
                                    key={key}
                                    label={`${filter?.label || key}: ${value}`}
                                    onDelete={() => handleClear(key)}
                                    size="small"
                                />
                            );
                        })}
                        <Chip
                            label="Clear all"
                            onDelete={handleReset}
                            size="small"
                            color="error"
                            variant="outlined"
                        />
                    </Box>
                )}
            </Collapse>
        </Paper>
    );
}