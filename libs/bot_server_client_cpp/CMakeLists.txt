project("bot_server_client")

find_package(Boost 1.40 COMPONENTS program_options REQUIRED)

include_directories( ${PROJECT_SOURCE_DIR}/lib/include)


add_library("bot_server_client" 
    lib/src/socket.cpp
    lib/src/connection.cpp
    lib/src/protocol.cpp
    lib/src/helper.cpp
)
include_directories("bot_server_client" ${Boost_INCLUDE_DIR} websocketpp json/single_include)
target_link_libraries("bot_server_client" ${Boost_LIBRARIES} pthread)


option(BUILD_TEST_FILE "Build test/main.cpp" OFF)

if (BUILD_TEST_FILE)
    add_executable("test" test/main.cpp)
    target_link_libraries("test" bot_server_client)
endif(BUILD_TEST_FILE)