select 
  namespace.uuid as namepsace,
  app.name,
  app.uuid as app_id,
  app.secret_key
from app inner join namespace on app.namespace_id = namespace_id
where namespace.id = 1;
