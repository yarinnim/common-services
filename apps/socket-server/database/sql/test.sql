select app.id, app.uuid, app.secret_key, app.name
from app inner join namespace on namespace.id = app.namespace_id
where app.deleted_at is null 
and (app.expired_at is null or app.expired_at >= current_timestamp) 
and namespace.uuid = '079594bb-4823-4c6c-a490-3e48ed245298'
and app.uuid = 'fb4eb0be-8f00-46d4-ac38-451df5d1f7eb'
and app.secret_key = '123'
limit 1
