extends Node

# Test file untuk mensimulasikan error "Unable to iterate on object of type 'bool'"
# Error ini terjadi saat code mencoba melakukan for loop pada nilai boolean

var test_data: Variant = null
var result_array: Array = []

func _ready():
	print("=== Debug Test: Boolean Iteration Error ===")
	
	# Test case 1: Simulasi error saat get_data возвращает boolean
	test_data = simulate_get_data()
	
	# Line 55: Error terjadi di sini saat mencoba iterasi pada boolean
	result_array = process_data_safe(test_data)
	
	print("Test completed. Result: ", result_array)

# Fungsi yang mengembalikan boolean (menyebabkan error jika diiterasi)
func simulate_get_data() -> Variant:
	# Ini akan mengembalikan boolean, bukan array
	return true

# Fungsi yang akan crash dengan error "Unable to iterate on object of type 'bool'"
# jika tidak ada validasi tipe data
func process_data(data: Variant) -> Array:
	var results: Array = []
	
	# Line 55: Error terjadi di sini saat mencoba for loop pada boolean
	for item in data:
		results.append(item)
	
	return results

# Fungsi yang aman dengan validasi tipe
func process_data_safe(data: Variant) -> Array:
	var results: Array = []
	
	# Validasi tipe sebelum iterasi
	if typeof(data) != TYPE_BOOL:
		for item in data:
			results.append(item)
	else:
		print("WARNING: Data is boolean, skipping iteration")
		results = []
	
	return results

# Test untuk verifikasi apakah error terjadi
func run_error_test() -> bool:
	var error_occurred: bool = false
	
	# Simulasi kondisi yang menyebabkan error
	var boolean_value: bool = true
	
	# Ini akan menyebabkan error "Unable to iterate on object of type 'bool'"
	# Comment out untuk test normal
	# for item in boolean_value:
	#     pass
	
	return error_occurred
