const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
function testTag(tagText) {
  try {
    const zip = new PizZip();
    zip.file('word/document.xml', '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p><w:r><w:t>' + tagText + '</w:t></w:r></w:p></w:body></w:document>');
    zip.file('[Content_Types].xml', '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/></Types>');
    zip.file('_rels/.rels', '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/></Relationships>');
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render({nama: 'Test'});
  } catch (e) {
    if (e.properties && e.properties.errors) {
      console.log(tagText, '=>', e.properties.errors.map(err => err.properties.xtag).join(' | '));
    } else {
      console.log(tagText, '=>', e.message);
    }
  }
}

testTag('{{{nama}}}');
testTag('{{{{nama}}}}');
testTag('{{nama}} {{nama}}');
testTag('{{{{nama');
testTag('{{nama');
testTag('nama}}');
testTag('{{nama}} }}');
testTag('{{nama}} {{');
testTag('{{nama{{');
