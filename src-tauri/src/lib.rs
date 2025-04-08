pub mod db;
pub mod handlers;
pub mod models;
pub mod parsers;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    let migrations = crate::db::migrations::get_migrations();

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
    }

    builder = builder.plugin(
        tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:insighter.db", migrations)
            .build(),
    );

    builder = builder.invoke_handler(tauri::generate_handler![
        handlers::chat::create_chat_message,
        handlers::chat::update_chat_message,
    ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
