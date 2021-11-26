import { Box } from '@chakra-ui/react'
const CardSmText = ({ children }) => {
  return (
    <Box fontSize="sm" as="p">
      {children}
    </Box>
  )
}
export default CardSmText
