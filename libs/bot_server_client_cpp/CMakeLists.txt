project("bot_server_client")

find_package(Boost 1.40 COMPONENTS program_options REQUIRED)
include_directories(${Boost_INCLUDE_DIR} ${PROJECT_SOURCE_DIR}/lib/include)


add_library("bot_server_client" 
    lib/src/socket.cpp
)
include_directories("bot_server_client" websocketpp)
target_link_libraries("bot_server_client" ${Boost_LIBRARIES} pthread)


add_executable("test" test/main.cpp)
target_link_libraries("test" bot_server_client)
