
const columns = [
  { key: "name", title: "Param" },
  { key: "type", title: "Type" },
  { key: "format", title: "Format" },
  { key: "nullable", title: "Nullable" },
  { key: "constraints", title: "Constraints" },
  { key: "description", title: "Description" }, 
]

export function jsonSchemaToMarkdownTable(schema) {
  const rows = jsonSchemaToMarkdownRows(null, -1, schema)
  rows.forEach((row) => {
    row.name = new Array(row.level * 3).fill(0).map(() => "&nbsp;").join("") + row.name
  })

  const title = columns.map(c => c.title).join("|")
  const separator = columns.map(() => "-").join("|")
  const lines = rows.map(row => columns.map(c => row[c.key]).join("|")).join("\n")
  return `${title}\n${separator}\n${lines}`
}

function jsonSchemaToMarkdownRows(name, level = 0, schema) {
  let rows = []

  const {
    type, title, description, default: defaultValue, enums, examples, nullable,
  } = schema

  const row = {
    name, type, description, constraints: [], nullable: nullable?"Y":"N", level,
  }

  if(title){
    row.description = title + " " + (row.description || "") 
  }
  if(examples){
    row.description = (row.description || "") + " Examples: "+examples
  }


  if (name) {
    rows.push(row)
  }

  if(defaultValue!==undefined){
    row.constraints.push(`default=`+defaultValue)
  }
  if (enums) {
    row.constraints.push(`enums=${enums.map(v => JSON.stringify(v)).join(",")}`)
  }

  if (type === "string") {
    const {
      format, pattern, minLength, maxLength,
    } = schema
    if (format) row.format = format
    if (pattern) row.constraints.push(`pattern=${pattern}`)
    if (minLength > 0) row.constraints.push(`minLength=${minLength}`)
    if (maxLength > 0) row.constraints.push(`maxLength=${maxLength}`)
  } else if (type === "integer" || type === "number") {
    const {
      minimum, maximum,
    } = schema
    if (minimum !== undefined) row.constraints.push(`minimum=${minimum}`)
    if (maximum !== undefined) row.constraints.push(`maximum=${maximum}`)
  } else if (type === "array") {
    const { items, additionItems } = schema
    if (additionItems === false) row.constraints.push(`additionItems=${additionItems}`)
    row.type = `${row.type}<${items.type}>`

    if (items.type === "object") {
      const subRows = jsonSchemaToMarkdownRows("<item>", level + 1, items)
      rows = rows.concat(subRows)
    // const { properties } = items;
    //   if (properties) {
    //     Object.keys(properties).forEach((propName) => {
    //       const subRows = jsonSchemaToMarkdownRows(propName, level + 1, properties[propName]);
    //       rows = rows.concat(subRows);
    //     });
    //   }
    }
  } else if (type === "object") {
    const { properties, additionProperties, required } = schema
    if (required) row.constraints.push(`required=${required}`)
    if (additionProperties === false) row.constraints.push(`additionProperties=${additionProperties}`)
    if (properties) {
      Object.keys(properties).forEach((propName) => {
        const subRows = jsonSchemaToMarkdownRows(propName, level + 1, properties[propName])
        rows = rows.concat(subRows)
      })
    }
  }

  // @ts-ignore
  row.constraints = row.constraints.join(", ")

  Object.keys(row).forEach(key=>{
    row[key] = escape(row[key])
  })

  return rows
}

function escape(str){
  if(!str || typeof str !== "string") return str
  return str.replace(/(<|>)/g, "\\$1")
}