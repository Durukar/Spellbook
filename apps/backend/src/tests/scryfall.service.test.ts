import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scryfallService } from '../services/scryfall.service'

const mockFetch = vi.mocked(fetch)

const mockCard = {
  id: 'abc123',
  name: 'Lightning Bolt',
  set: 'lea',
  set_name: 'Limited Edition Alpha',
  collector_number: '161',
  rarity: 'common',
  prices: { usd: '1.00', usd_foil: null, eur: '0.90' },
  image_uris: {
    small: 'https://example.com/small.jpg',
    normal: 'https://example.com/normal.jpg',
    large: 'https://example.com/large.jpg',
  },
}

function mockOkResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

function mockErrorResponse(status: number) {
  return { ok: false, status } as unknown as Response
}

describe('scryfallService.searchCards', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns cards when API responds with 200', async () => {
    const payload = { data: [mockCard], has_more: false, total_cards: 1 }
    mockFetch.mockResolvedValueOnce(mockOkResponse(payload))

    const result = await scryfallService.searchCards('Lightning Bolt')

    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('Lightning Bolt')
    expect(result.total_cards).toBe(1)
  })

  it('calls Scryfall search endpoint with correct query', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse({ data: [], has_more: false, total_cards: 0 }))

    await scryfallService.searchCards('bolt', 2)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('q=bolt'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.any(Object)
    )
  })

  it('returns empty result when API returns 404', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404))

    const result = await scryfallService.searchCards('xyznotfound')

    expect(result.data).toHaveLength(0)
    expect(result.total_cards).toBe(0)
    expect(result.has_more).toBe(false)
  })

  it('throws when API returns non-404 error', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(500))

    await expect(scryfallService.searchCards('bolt')).rejects.toThrow('Scryfall search failed: 500')
  })
})

describe('scryfallService.getCardById', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the card when found', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(mockCard))

    const card = await scryfallService.getCardById('abc123')

    expect(card.id).toBe('abc123')
    expect(card.name).toBe('Lightning Bolt')
  })

  it('calls the correct Scryfall endpoint with the id', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(mockCard))

    await scryfallService.getCardById('abc123')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/cards/abc123'),
      expect.any(Object)
    )
  })

  it('throws when card is not found', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404))

    await expect(scryfallService.getCardById('invalid-id')).rejects.toThrow('Card not found: invalid-id')
  })
})

describe('scryfallService.getCardByName', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the card when found by exact name', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(mockCard))

    const card = await scryfallService.getCardByName('Lightning Bolt')

    expect(card.name).toBe('Lightning Bolt')
  })

  it('calls the named endpoint with exact param', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(mockCard))

    await scryfallService.getCardByName('Lightning Bolt')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/cards/named'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('exact=Lightning+Bolt'),
      expect.any(Object)
    )
  })

  it('throws when card is not found', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404))

    await expect(scryfallService.getCardByName('Nonexistent Card')).rejects.toThrow('Card not found: Nonexistent Card')
  })
})
