import { useEffect, useState } from 'react'
import { Box, Button, Container, Dialog, DialogContent, DialogTitle, Grid, Pagination, SxProps, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { usePagination } from "react-use-pagination"
import { Photo } from '../interfaces'
import { fetcher } from '../utils/fetchers'
import { Theme } from '@mui/system'

const COLOR_GREEN = '#559250'
const COLOR_BLACK = '#252525'
const COLOR_WHITE = '#FFFFFF'
const INITIAL_PAGE_SIZE = 10

const titleStyle: SxProps<Theme> = {
  fontSize: '40px',
  lineHeight: '130%',
  textAlign: 'center',
  fontWeight: 700,
  marginBottom: '40px'
}

const labelBoxStyle: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  marginLeft: '-4px',
  marginRight: '-4px',
  marginBottom: '40px'
}

const labelStyle: SxProps<Theme> = {
  backgroundColor: COLOR_GREEN,
  padding: '2px 12px',
  color: '#fff',
  margin: '4px',
  cursor: 'pointer',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: COLOR_GREEN,
  minWidth: '60px',
  width: { xs: 'calc(100% / 5 - 8px)', sm: 'calc(100% / 10 - 8px)', md: 'calc(100% / 16 - 8px)' },
  textAlign: 'center',
  borderRadius: '4px'
}

interface Props {
  photos: Photo[],
  albumIds: number[]
}

const getPhotosFromAlbum = (photos: Photo[], albumId: number) => {
  return photos.filter(p => p.albumId === albumId)
}

const HomePage = ({ photos: allPhotos, albumIds }: Props) => {
  const [photos, setPhotos] = useState(allPhotos)
  const [activeAlbumId, setActiveAlbumId] = useState<number>(albumIds[0])
  const [photosFromAlbum, setPhotosFromAlbum] = useState<Photo[]>([])

  const [activeId, setActiveId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  const {
    currentPage,
    startIndex,
    endIndex,
    setPage
  } = usePagination({ totalItems: photosFromAlbum.length, initialPageSize: INITIAL_PAGE_SIZE })

  useEffect(() => {
    const ps = getPhotosFromAlbum(photos, activeAlbumId)
    setPhotosFromAlbum(ps)
  }, [photos, activeAlbumId])

  const handleOpenModal = (id: number) => {
    setActiveId(id)
    setOpen(true)
  }

  return (
    <>
      <Box sx={{ padding: '80px 0' }}>
        <Container>
          <Typography component="h1" sx={titleStyle}>
            Photos
          </Typography>

          <Typography sx={{ marginBottom: '20px' }}>Select album id:</Typography>

          <Box sx={labelBoxStyle}>
            {albumIds.map(ai => (
              <Box
                key={ai}
                component="span"
                sx={{
                  ...labelStyle,
                  backgroundColor: activeAlbumId === ai ? COLOR_GREEN : COLOR_WHITE,
                  color: activeAlbumId === ai ? COLOR_WHITE : COLOR_BLACK
                }}
                onClick={() => setActiveAlbumId(ai)}
              >
                {ai}
              </Box>
            ))}
          </Box>

          <Grid container spacing={3}>
            {photosFromAlbum.slice(startIndex, endIndex).map((p, i) => (
              <Grid key={p.id} item xs={12} sm={6}>
                {i % 2 !== 0 && (
                  <Box sx={{ height: '50px' }}></Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box component="img" src={p.thumbnailUrl} sx={{ borderRadius: '4px', objectFit: 'cover', objectPosition: 'center' }} />
                  <Box sx={{ padding: '20px' }}>
                    <Typography component="h4" sx={{ fontWeight: 700, color: '#555' }}>
                      {p.title}
                    </Typography>
                    <Box sx={{ display: 'flex', marginTop: '20px' }}>
                      <Button variant="contained" sx={{ marginRight: '20px' }} onClick={() => handleOpenModal(p.id)}>See</Button>
                      <Button variant="outlined" onClick={() => setPhotos(prev => prev.filter(item => item.id !== p.id))}>Delete</Button>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <Pagination
              color="primary"
              count={Math.round(photosFromAlbum.length / INITIAL_PAGE_SIZE)}
              page={currentPage + 1}
              onChange={(e, page) => setPage(page - 1)}
            />
          </Box>
        </Container>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" scroll="body">
        <DialogTitle>{photos.filter(p => p.id === activeId)[0]?.title}</DialogTitle>
        <DialogContent>
          {activeId && (
            <Box component="img" src={photos.filter(p => p.id === activeId)[0]?.url} sx={{ maxWidth: '100%' }} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default HomePage

const getUniqueAlbumIds = (photos: Photo[]) => {
  return Array.from(new Set(photos.map(p => p.albumId)))
}

export const getStaticProps: GetStaticProps = async (context) => {
  const photos: Photo[] = await fetcher(process.env.NEXT_PUBLIC_API_URL + '/photos')

  // Получаем уникальные id альбомов
  const albumIds = getUniqueAlbumIds(photos)

  return {
    props: {
      photos,
      albumIds
    },
    revalidate: 60
  }
}