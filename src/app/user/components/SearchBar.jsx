import React, { useState, useRef, useEffect } from 'react';
import {
    Paper,
    InputBase,
    IconButton,
    Box,
    Popper,
    Paper as PopperPaper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ClickAwayListener,
    Chip,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    History as HistoryIcon,
    TrendingUp as TrendingIcon,
    Store as StoreIcon,
    Work as WorkIcon,
    LocalHospital as DoctorIcon,
    Church as ChurchIcon
} from '@mui/icons-material';

const suggestionIcons = {
    business: <StoreIcon fontSize="small" />,
    job: <WorkIcon fontSize="small" />,
    doctor: <DoctorIcon fontSize="small" />,
    worship: <ChurchIcon fontSize="small" />,
    trending: <TrendingIcon fontSize="small" />,
    history: <HistoryIcon fontSize="small" />
};

export default function SearchBar({
    value,
    onChange,
    onSearch,
    suggestions = [],
    onSuggestionClick,
    onClear,
    placeholder = "Search for shops, jobs, doctors..."
}) {
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);
    const anchorRef = useRef(null);

    useEffect(() => {
        setOpen(value.length >= 2 && suggestions.length > 0);
    }, [value, suggestions]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
            setOpen(false);
        }
    };

    const handleClear = () => {
        onChange({ target: { value: '' } });
        if (onClear) onClear();
        inputRef.current?.focus();
    };

    const handleSuggestionClick = (suggestion) => {
        if (onSuggestionClick) {
            onSuggestionClick(suggestion);
        } else {
            onChange({ target: { value: suggestion.text } });
            onSearch();
        }
        setOpen(false);
    };

    return (
        <Box ref={anchorRef}>
            <Paper
                elevation={0}
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: '#e0e0e0',
                    borderRadius: 3,
                    bgcolor: 'white'
                }}
            >
                <IconButton sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                </IconButton>
                <InputBase
                    inputRef={inputRef}
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => value.length >= 2 && setOpen(true)}
                />
                {value && (
                    <IconButton sx={{ p: '10px' }} onClick={handleClear}>
                        <ClearIcon />
                    </IconButton>
                )}
            </Paper>

            {/* Suggestions Popper */}
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                sx={{ width: anchorRef.current?.clientWidth, zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                    <PopperPaper elevation={3} sx={{ mt: 1, borderRadius: 2, maxHeight: 400, overflow: 'auto' }}>
                        <List dense>
                            {/* Search suggestion */}
                            {value.length >= 2 && (
                                <ListItem button onClick={() => handleSuggestionClick({ text: value, type: 'search' })}>
                                    <ListItemIcon>
                                        <SearchIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={`Search for "${value}"`}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            )}

                            {suggestions.length > 0 && <Divider />}

                            {/* Suggestions */}
                            {suggestions.map((suggestion, index) => (
                                <ListItem
                                    key={index}
                                    button
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <ListItemIcon>
                                        {suggestionIcons[suggestion.type] || suggestionIcons.trending}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{suggestion.text}</span>
                                                <Chip
                                                    label={suggestion.category}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        }
                                        secondary={suggestion.count ? `${suggestion.count} searches` : ''}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </PopperPaper>
                </ClickAwayListener>
            </Popper>
        </Box>
    );
}