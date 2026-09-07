# Compatibility shim for the Liquid version bundled with GitHub Pages.
# Ruby 4 removed Object#tainted?, while Liquid 4.0.3 still calls it.
class Object
  def tainted?
    false
  end unless method_defined?(:tainted?)
end
