project("telegram_client")

add_subdirectory("bot_server_client")
add_subdirectory("mime")
add_subdirectory(tgbot-cpp)

set (CMAKE_CXX_STANDARD 20)

add_compile_options(
	-g
)

add_executable("telegram_client" 
	main.cpp
)
include_directories("telegram_client" ${BSC_INCLUDE_P} ${MIME_INCLUDE_P})
target_link_libraries("telegram_client" BSC mime TgBot)