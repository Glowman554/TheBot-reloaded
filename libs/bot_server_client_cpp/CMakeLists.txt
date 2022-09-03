project("BSC")

find_package(Boost 1.40 COMPONENTS program_options REQUIRED)

set(BSC_INCLUDE ${Boost_INCLUDE_DIR} ${PROJECT_SOURCE_DIR}/websocketpp ${PROJECT_SOURCE_DIR}/json/single_include ${PROJECT_SOURCE_DIR}/lib/include)
set(BSC_INCLUDE_P ${BSC_INCLUDE} PARENT_SCOPE)

set (CMAKE_CXX_STANDARD 20)

add_library("BSC" 
    lib/src/socket.cpp
    lib/src/connection.cpp
    lib/src/protocol.cpp
    lib/src/helper.cpp
)
include_directories("BSC" ${BSC_INCLUDE})
target_link_libraries("BSC" ${Boost_LIBRARIES} pthread)


option(BUILD_TEST_FILE "Build test/main.cpp" OFF)

if (BUILD_TEST_FILE)
    add_executable("test" test/main.cpp)
	include_directories("test" ${BSC_INCLUDE})
    target_link_libraries("test" BSC)
endif(BUILD_TEST_FILE)