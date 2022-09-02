project("mimr")

set(MIME_INCLUDE ${PROJECT_SOURCE_DIR})
set(MIME_INCLUDE_P ${MIME_INCLUDE} PARENT_SCOPE)

set (CMAKE_CXX_STANDARD 20)

add_library("mime" 
	mime.cpp
)
include_directories("mime" ${MIME_INCLUDE})