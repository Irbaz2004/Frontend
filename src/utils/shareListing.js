export async function shareListing({ title, text, url = window.location.href }) {
    const data = { title, text, url };
    if (navigator.share) {
        try {
            await navigator.share(data);
            return 'Shared successfully';
        } catch (error) {
            if (error?.name === 'AbortError') return '';
        }
    }

    await navigator.clipboard.writeText(url);
    return 'Link copied to clipboard';
}

export function getListingShareUrl(type, id) {
    const pluralType = type === 'house' ? 'houses' : type === 'job' ? 'jobs' : 'shops';
    return `${window.location.origin}/share/${pluralType}/${encodeURIComponent(id)}`;
}
