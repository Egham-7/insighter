use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_chat_messages_table",
            sql: r#"
                CREATE TABLE chat_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp INTEGER NOT NULL
                );"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_file_attachments_table",
            sql: r#"
                CREATE TABLE file_attachments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chat_message_id INTEGER NOT NULL,
                    file_name TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    data TEXT NOT NULL,
                    FOREIGN KEY (chat_message_id) 
                        REFERENCES chat_messages(id) 
                        ON DELETE CASCADE
                );"#,
            kind: MigrationKind::Up,
        },
    ]
}
